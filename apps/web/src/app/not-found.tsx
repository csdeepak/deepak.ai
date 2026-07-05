import Link from "next/link";
import { Container } from "@/components/layout/container";
import { NAV_LANES } from "@/constants/routes";

/**
 * 404 — docs/04 §5 error grammar: calm, honest, in-character, forward
 * paths, full chrome (maximum wayfinding at the moment of loss).
 * Needed from day one: permanent URLs exist before their pages do.
 */
export default function NotFound() {
  return (
    <Container width="reading" className="py-24">
      <h1 className="text-h1 font-semibold">
        This page doesn&apos;t exist — or doesn&apos;t exist yet.
      </h1>
      <p className="mt-4 text-body text-muted">
        The Labs is built in the open; some rooms aren&apos;t furnished
        yet. Here&apos;s where things are:
      </p>
      <ul className="mt-8 space-y-3">
        {NAV_LANES.map((lane) => (
          <li key={lane.href}>
            <Link
              href={lane.href}
              className="text-body text-accent underline-offset-2 hover:underline"
            >
              {lane.label} →
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
