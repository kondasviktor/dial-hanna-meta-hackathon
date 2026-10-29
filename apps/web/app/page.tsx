import type { Metadata } from "next";
import Landing from "./landing";

export const metadata: Metadata = {
  title: "Dial Hanna — Ha nem érsz rá, Hanna felveszi",
  description:
    "Tartsd meg a saját számodat. Hanna magyarul vagy angolul fogadja az átirányított hívásokat, időpontot foglal, és kész teendőt ad át.",
};

export default function Home() {
  return <Landing lang="hu" />;
}
