import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRoomBySlug } from "@/lib/listings";
import Navbar from "@/components/Navbar";
import RoomDetailClient from "@/components/room/RoomDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) return { title: "Habitación no encontrada | Nidoo" };
  return {
    title: `${room.title} — $${room.price}/mes | Nidoo`,
    description: room.description.slice(0, 155),
    openGraph: {
      title: room.title,
      description: room.description.slice(0, 155),
      images: room.images[0] ? [room.images[0]] : [],
    },
  };
}

export default async function HabitacionPage({ params }: Props) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  return (
    <>
      <Navbar />
      <RoomDetailClient room={room} />
    </>
  );
}
