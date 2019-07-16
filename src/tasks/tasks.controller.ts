import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UsePipes, ValidationPipe, ParseIntPipe, UseGuards, Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { TaskStatus } from './task.status.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TaskController');
    constructor(private taskService: TasksService) {}

    @Get()
    getTasks(
        @GetUser() user: User,
        @Query(ValidationPipe) filterDto: GetTasksFilterDto) {

        this.logger.verbose(`User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`)
        return this.taskService.getTasks(filterDto, user);
    }

    @Get('/:id')
    getTaskById(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number): Promise<Task> {
        return this.taskService.getTaskById(id, user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @GetUser() user: User,
        @Body() createTaskDto: CreateTaskDto): Promise<Task> {

        this.logger.verbose(`User: "${user.username}" created a new task. Data: ${JSON.stringify(createTaskDto)}`)
        return this.taskService.createTask(createTaskDto, user);
    }

    @Delete('/:id')
    deleteTask(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.taskService.deleteTask(id, user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User
    ): Promise<Task> {
        
        return this.taskService.updateTaskStatus(id, status, user);

    }
}
