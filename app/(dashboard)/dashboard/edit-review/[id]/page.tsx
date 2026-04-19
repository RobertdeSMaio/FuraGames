import prisma from "@/lib/prisma";
import { GameReview } from "@/lib/types";
import { notFound } from "next/navigation";
import EditReviewForm from "./form";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const review = await prisma.gameReview.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (!review) notFound();

  const { user, ...rest } = review;

  const formattedReview: GameReview = {
    ...rest,
    userName: user?.name || "Usuário",
    groupId: rest.groupId ?? undefined,
    coverImage: rest.coverImage ?? undefined,
    status: rest.status as GameReview["status"],
  };

  return <EditReviewForm review={formattedReview} />;
}
