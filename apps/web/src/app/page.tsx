import { Container } from "@/components/layout/container";

/**
 * Root route — intentionally minimal.
 * The landing page is Sprint 1 (specs/landing.md); Sprint 0 ships the
 * foundation only. No placeholder portfolio content (sprint rule).
 */
export default function HomePage() {
  return (
    <Container width="content" className="py-24">
      <h1 className="text-h1 font-semibold">Deepak Labs</h1>
    </Container>
  );
}
