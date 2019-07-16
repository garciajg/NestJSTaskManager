import { Repository, EntityRepository } from "typeorm";
import { Task } from "./task.entity";
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task.status.enum';
import { GetTasksFilterDto } from "./dto/get-task-filter.dto";
import { User } from "../auth/user.entity";
import { Logger, InternalServerErrorException } from "@nestjs/common";
import { throws } from "assert";


@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    private logger = new Logger('TaskRepository');
    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;

        const task = new Task();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.user = user;

        await task.save();
        delete task.user;

        return task;
    }

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('task');

        query.where('task.userId = :userId', { userId: user.id });
        
        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%` });
        }

        try {
            let tasks = await query.getMany();

            return tasks;
        } catch (err) {
            this.logger.error(`Failed to get tasks for user "${user.username}"`, err.stack)
            throw new InternalServerErrorException()
        }
    }
}