// https://github.com/refinedev/refine/blob/next/packages/simple-rest/src/provider.ts
import { DataProvider } from "@pankod/refine-core";
import { FindOptions, remult } from "remult";
import { CrudFilters, LogicalFilter } from "@pankod/refine-core";
import { ComparisonValueFilter, ContainsStringValueFilter, EntityFilter } from "remult";



export const dataProvider = (
  entities: any[]
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => {
  function repoByKey(key: string) {
    for (const e of entities) {
      const repo = remult.repo(e as any)
      if (repo.metadata.key === key)
        return repo;
    }
    throw Error("not found");
  }
  return ({
    getList: async ({
      resource,
      hasPagination = true,
      pagination = { current: 1, pageSize: 10 },
      filters,
      sort,
    }) => {
      const repo = repoByKey(resource);
      const options: FindOptions<any> = {
        page: (pagination.current || 1) - 1,
        limit: pagination.pageSize
      }
      if (sort) {
        options.orderBy = {};
        for (const s of sort) {
          options.orderBy[s.field] = s.order;
        }
      }
      options.where = generateFilter(filters);
      return {
        data: await repo.find(options) as any,
        total: await repo.count(options.where),
      };
    },

    getMany: async ({ resource, ids }) => {

      const data = await repoByKey(resource).find({
        where: {
          //TODO - I don't like it that when there are no ids it returns all, but that's the way the original example worked
          //@ts-ignore
          id: ids?.length > 0 ? ids : undefined
        }
      }) as any;
      return {
        data
      };
    },

    create: async ({ resource, variables }) => {
      return {
        data: await repoByKey(resource).insert(variables as any) as any
      };
    },

    update: async ({ resource, id, variables }) => {

      return {
        data: await repoByKey(resource).update(id as any, variables as any) as any,
      };
    },

    getOne: async ({ resource, id }) => {
      return {
        data: await repoByKey(resource).findId(id as any) as any
      };
    },

    deleteOne: async ({ resource, id, variables }) => {
      await repoByKey(resource).delete(id as any)
      return {
        data: {} as any,
      };
    },

    getApiUrl: () => {
      return 'not relevant';
    },

    custom: async ({ url, method, filters, sort, payload, query, headers }) => {
      throw Error("custom is not yet implemented, please open a ticket for it");
    },
  })
};



export const generateFilter = (filters?: CrudFilters) => {
  let where: EntityFilter<any> = {};
  if (filters)
    for (const filter of filters) {
      const lf = filter as LogicalFilter;
      let z: (ComparisonValueFilter<string | null> | ContainsStringValueFilter | null)
      if (lf && lf.field) {
        switch (lf.operator) {
          case "eq":
            z = lf.value;
            break;
          case "ne":
            z = { $ne: lf.value }
            break;
          case "lt":
            z = { $lt: lf.value };
            break;
          case "gt":
            z = { $gt: lf.value };
            break;
          case "lte":
            z = { $lte: lf.value };
            break;
          case "gte":
            z = { $gte: lf.value };
            break;
          case "in":
            z = lf.value;
            break;
          case "nin":
            z = { $ne: lf.value };
            break;
          case "contains":
            z = { $contains: lf.value };
            break;
          case "null":
            z = null;
            break;
          case "nnull":
            z = { $ne: null };
            break;
          case "between":
          case "nbetween":
          case "startswith":
          case "nstartswith":
          case "ncontains":
          case "containss":
          case "ncontainss":
          case "startswiths":
          case "nstartswiths":
          case "endswith":
          case "nendswith":
          case "endswiths":
          case "nendswiths":
          default:
            throw Error(`operator ${lf.operator} was not yet implemented, please open an issue and we'll add this. ${JSON.stringify(filter)}`)
        }
        where[lf.field] = z;
      }
      else {
        throw Error("only logical filters were implemented, please open an issue and we'll add this")
      }
    }

  return where;
};