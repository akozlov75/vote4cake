export type Cake = {
  id: string;
  name: string;
  imageUrl: string;
};

export const CAKES: Cake[] = [
  {
    id: "choco-dream",
    name: "Chocolate Dream",
    imageUrl: "/cakes/choco-dream.jpg",
  },
  {
    id: "berry-cloud",
    name: "Berry Cloud",
    imageUrl: "/cakes/berry-cloud.jpg",
  },
  {
    id: "lemon-zest",
    name: "Lemon Zest",
    imageUrl: "/cakes/lemon-zest.jpg",
  },
  {
    id: "caramel-crunch",
    name: "Caramel Crunch",
    imageUrl: "/cakes/caramel-crunch.jpg",
  },
];
