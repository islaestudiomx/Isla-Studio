import AboutSection from "./components/AboutSection";
import DisciplinasSection from "./components/DisciplinasSection";
import Hero from "./components/Hero";
import HowToBook from "./components/HowtoBook";
import LinksSection from "./components/LinkSection";

export default function Home() {
  return (
    <div>
      <Hero></Hero>
      <AboutSection></AboutSection>
      <DisciplinasSection></DisciplinasSection>
      <HowToBook></HowToBook>
      <LinksSection></LinksSection>
    </div>
    );
}
