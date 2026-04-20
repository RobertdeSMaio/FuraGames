import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditReviewForm from "./form";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const review = await prisma.gameReview.findUnique({ where: { id } });

  if (!review) notFound();

  return <EditReviewForm review={review} />;
}
