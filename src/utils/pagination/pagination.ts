import { Repository, SelectQueryBuilder, ObjectLiteral } from "typeorm";
import { plainToClass, ClassConstructor } from "class-transformer";
import logger from "../../utils/logger";

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginationUtil {
  static async paginate<T extends ObjectLiteral, D = T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions,
    dtoClass?: ClassConstructor<D>
  ): Promise<PaginatedResponse<D>> {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    if (sortBy) {
      queryBuilder.orderBy(sortBy, sortOrder || "ASC");
    }

    logger.info(`Executing paginate query: ${queryBuilder.getQuery()}`);

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    logger.info(`Raw data fetched: ${JSON.stringify(data)}`);

    const totalPages = Math.ceil(total / limit);

    let resultData: D[];
    if (dtoClass) {
      logger.info(`Transforming data to ${dtoClass.name}`);
      resultData = data.map((item, index) => {
        const transformed = plainToClass(dtoClass, item, {
          excludeExtraneousValues: true,
        });
        logger.info(
          `Transformed item ${index}: ${JSON.stringify(transformed)}`
        );
        return transformed;
      });
    } else {
      resultData = data as unknown as D[];
    }

    logger.info(
      `Pagination result: ${JSON.stringify({
        dataLength: resultData.length,
        total,
        page,
        limit,
        totalPages,
      })}`
    );

    return {
      data: resultData,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static createPaginationOptions(query: any): PaginationOptions {
    return {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder?.toUpperCase() as "ASC" | "DESC",
    };
  }
}
