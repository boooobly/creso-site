export type Baguette = {
  id: string;
  name: string;
  image: string;
  availableLength: number;
  profileWidth?: number;
};

export const BAGUETTES: readonly Baguette[] = [
  { id: 'bg-01', name: 'Классик Орех', image: '/logo.svg', availableLength: 420, profileWidth: 3.2 },
  { id: 'bg-02', name: 'Сканди Белый', image: '/logo.svg', availableLength: 300, profileWidth: 2.4 },
  { id: 'bg-03', name: 'Золото Премиум', image: '/logo.svg', availableLength: 510, profileWidth: 4.1 },
  { id: 'bg-04', name: 'Минимал Черный', image: '/logo.svg', availableLength: 220, profileWidth: 1.8 },
];
