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

export function makeData(len: number): Resource[] {
  return range(len).map((index): Resource => {
    return newResource(`load-balancer-${index}`, index);
  });
}
