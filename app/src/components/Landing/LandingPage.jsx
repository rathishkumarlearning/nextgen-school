import Hero from './Hero';
import Metrics from './Metrics';
import Principles from './Principles';
import CourseCards from './CourseCards';
import Pricing from './Pricing';

function LandingPage() {
  return (
    <div className="w-full">
      <Hero />
      <Metrics />
      <Principles />
      <CourseCards />
      <Pricing />
    </div>
  );
}

export default LandingPage;
