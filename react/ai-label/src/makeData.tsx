import { faker } from '@faker-js/faker';
import { ExampleAiLabel } from './ExampleAiLabel';
import { ReactNode } from 'react';

export type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
  subRows?: Resource[];
  aiLabel?: ({ isRowAILabel }: { isRowAILabel?: boolean }) => ReactNode;
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newResource = (id: string, index: number, config): Resource => {
  const isAIRow = config?.aiLabelRows.includes(index);
  return {
    ...(isAIRow && {
      aiLabel: () => <ExampleAiLabel isRowAILabel />,
    }),
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

export function makeData(...lens: any[]) {
  const config = lens.filter((a) => typeof a === 'object')[0];
  const filteredData = lens.filter((a) => typeof a === 'number');
  const makeDataLevel = (depth = 0): Resource[] => {
    const len = filteredData[depth]!;
    return range(len).map((index): Resource => {
      return {
        ...newResource(`load-balancer-${index}`, index, config),
        subRows: filteredData[depth + 1] ? makeDataLevel(depth + 1) : undefined,
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
