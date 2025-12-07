import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import LogoCarousel from './logoCarousel';
import { ReadyToStartFooter } from './readyToStartFooter';
import BackToTopButton from './BackToTopButton';
import FloatingSupportButtons from './FloatingSupportButtons';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header />
      {children}
      <LogoCarousel />
      <ReadyToStartFooter />
      <Footer />
      <BackToTopButton />
      <FloatingSupportButtons />
    </>
  );
}
