// src/data/promotions.ts

// Definir el tipo para cada promoción
export interface Promotion {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string;
  }
  
  // Exportar el array de promociones con el tipo
  export const promotions: Promotion[] = [
    {
      id: 1,
      title: "2x1 en Frutas",
      description: "Lleva dos kilos de frutas seleccionadas por el precio de uno.",
      image: "https://st3.depositphotos.com/13404340/16067/i/450/depositphotos_160674604-stock-photo-fresh-fruits-falling-in-water.jpg?auto=format&fit=crop&q=80&w=500",
      link: "/promotions/fruits",
    },
    {
      id: 2,
      title: "30% en Verduras Orgánicas",
      description: "Descuento especial en toda nuestra línea de verduras orgánicas.",
      image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=500",
      link: "/promotions/organic-vegetables",
    },
    {
      id: 3,
      title: "Combo Familiar",
      description: "Ahorra 25% en nuestro paquete de frutas y verduras para toda la semana.",
      image: "https://images.pexels.com/photos/18212064/pexels-photo-18212064/free-photo-of-comida-frutas-colorido-de-colores.jpeg?auto=format&fit=crop&q=80&w=500",
      link: "/promotions/family-combo",
    },
    {
      id: 4,
      title: "Smoothie Pack",
      description: "40% de descuento en nuestro kit para smoothies saludables.",
      image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=500",
      link: "/promotions/smoothie-pack",
    },
    {
      id: 5,
      title: "Frutos Secos Premium",
      description: "Oferta especial: 20% off en toda la selección de frutos secos.",
      image: "https://st3.depositphotos.com/1027198/13269/i/450/depositphotos_132694536-stock-photo-assorted-nuts-in-bowl.jpg?auto=format&fit=crop&q=80&w=500",
      link: "/promotions/nuts",
    },
    {
      id: 6,
      title: "Caja de Temporada",
      description: "Productos de temporada con hasta 35% de descuento.",
      image: "https://st.depositphotos.com/2600593/5097/i/450/depositphotos_50973127-stock-photo-basket-of-seasonal-fruits.jpg?auto=format&fit=crop&q=80&w=500",
      link: "/promotions/seasonal-box",
    },
  ];