import PageWrapper from "../PageWrapper";
import Nav from "./Nav";

export default function Navbar() {
  return (
    <div className="bg-layout-dark text-white">
      <PageWrapper>
        <Nav />
      </PageWrapper>
    </div>
  );
}
