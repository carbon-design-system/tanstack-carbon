import { faker } from '@faker-js/faker';

export type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
  subRows?: Resource[];
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newResource = (id: string, index: number): Resource => {
  return {
    id,
    name: `Load balancer ${index}`,
    rule: faker.helpers.shuffle<Resource['rule']>([
      'DNS delegation',
      'Round Robin',
    ])[0],
    status: faker.helpers.shuffle<Resource['status']>([
      'starting',
      'active',
      'disabled',
    ])[0]!,
    other: 'Test',
    example: faker.number.int(1000).toString(),
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Resource[] => {
    const len = lens[depth]!;
    return range(len).map((index): Resource => {
      return {
        ...newResource(`load-balancer-${index}`, index),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}

//simulates a backend api
const data = makeData(1000);
export const fetchData = async (start: number, size: number) => {
  //simulate a backend api
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    data: data.slice(start, start + size),
    meta: {
      totalRowCount: data.length,
    },
  };
};

export type ResourceApiResponse = {
  data: Resource[];
  meta: {
    totalRowCount: number;
  };
};
