-- FuraGames - Migration inicial
-- Execute este arquivo no PostgreSQL para criar todas as tabelas

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  avatar      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de grupos
CREATE TABLE IF NOT EXISTS groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code  VARCHAR(50) NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Membros de grupos
CREATE TABLE IF NOT EXISTS group_members (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id   UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, group_id)
);

-- Reviews de jogos
CREATE TABLE IF NOT EXISTS game_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id     UUID REFERENCES groups(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  platform     VARCHAR(100) NOT NULL,
  genre        VARCHAR(100) NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  hours_played NUMERIC(8,1) NOT NULL DEFAULT 0,
  status       VARCHAR(30) NOT NULL CHECK (status IN ('playing','completed','dropped','on-hold','want-to-play')),
  review       TEXT NOT NULL,
  pros         TEXT[] NOT NULL DEFAULT '{}',
  cons         TEXT[] NOT NULL DEFAULT '{}',
  cover_image  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS game_reviews_updated_at ON game_reviews;
CREATE TRIGGER game_reviews_updated_at
  BEFORE UPDATE ON game_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Convites
CREATE TABLE IF NOT EXISTS invites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id       UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_email  VARCHAR(255) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_game_reviews_user_id ON game_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_game_reviews_group_id ON game_reviews(group_id);
CREATE INDEX IF NOT EXISTS idx_game_reviews_status ON game_reviews(status);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_invites_email_status ON invites(invited_email, status);
