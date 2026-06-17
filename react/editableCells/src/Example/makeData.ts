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

export const ruleOptions = [
  { id: 'dns_delegation', text: 'DNS delegation' },
  { id: 'round_robin', text: 'Round Robin' },
];
export const statusOptions = [
  { id: 'starting', text: 'Starting' },
  { id: 'active', text: 'Active' },
  { id: 'disabled', text: 'Disabled' },
];

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
    rule: faker.helpers.shuffle(ruleOptions.map((opt) => opt.id))[0],
    status: faker.helpers.shuffle(statusOptions.map((opt) => opt.id))[0]!,
    other: 'Test',
    example: faker.number.int(1000).toString(),
  };
};

export function makeData(len: number): Resource[] {
  return range(len).map((index): Resource => {
    return newResource(`load-balancer-${index}`, index);
  });
}
