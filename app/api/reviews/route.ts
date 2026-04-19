import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

  const reviews = await prisma.gameReview.findMany({
    where: {
      userId: auth.userId,
      ...(groupId && { groupId }),
      ...(status && { status }),
      ...(platform && { platform }),
      ...(genre && { genre }),
      ...(search && {
        title: { contains: search, mode: "insensitive" as const },
      }),
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      group: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    platform,
    genre,
    rating,
    hoursPlayed,
    status,
    review,
    pros,
    cons,
    coverImage,
    groupId,
  } = body;

  if (!title || !platform || !genre || rating == null || !status || !review)
    return NextResponse.json(
      { error: "Campos obrigatórios faltando" },
      { status: 400 },
    );

  if (rating < 1 || rating > 10)
    return NextResponse.json(
      { error: "Rating deve ser entre 1 e 10" },
      { status: 400 },
    );

  if (groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: auth.userId },
    });
    if (!membership)
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 },
      );
  }

  const newReview = await prisma.gameReview.create({
    data: {
      userId: auth.userId,
      title,
      platform,
      genre,
      rating: Number(rating),
      hoursPlayed: Number(hoursPlayed) || 0,
      status,
      review,
      pros: pros || [],
      cons: cons || [],
      coverImage: coverImage || null,
      groupId: groupId || null,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      group: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ review: newReview }, { status: 201 });
}
