import { MainLayout } from '@/components/layout/MainLayout';
import { Carousel } from '@/components/home/Carousel';


const slides = [
  {
    id: 1,
    title: 'Bienvenue sur Luxentis',
    description: 'Découvrez l\'économie de notre serveur Minecraft',
    image: 'images/carousel/1.png'
  },
  {
    id: 2,
    title: 'Marché en plein essor',
    description: 'Achetez et vendez des ressources avec d\'autres joueurs',
    image: 'images/carousel/2.png'
  },
  {
    id: 3,
    title: 'Métiers & compétences',
    description: 'Développez vos compétences et débloquez de nouvelles opportunités',
    image: 'images/carousel/3.png'
  },
  {
    id: 4,
    title: 'Créez votre entreprise',
    description: 'Fondez votre propre entreprise et prospérez dans notre économie',
    image: 'images/carousel/4.png'
  }
];

export default function HomePage() {
  return (
    <MainLayout fullHeight>
      <div className="relative h-[calc(100vh-136px)]">
        <div className="w-full h-full">
          <Carousel slides={slides} autoPlayInterval={7000} />
        </div>
      </div>
    </MainLayout>
  );
} 