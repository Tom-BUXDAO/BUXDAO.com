-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NFTs table
CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game_stats table
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  game_type TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update game stats
CREATE OR REPLACE FUNCTION update_game_stats(
  p_user_id UUID,
  p_game_type TEXT,
  p_won BOOLEAN,
  p_score INTEGER
) RETURNS VOID AS 11826
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM game_stats WHERE user_id = p_user_id AND game_type = p_game_type) INTO v_exists;
  
  IF v_exists THEN
    UPDATE game_stats
    SET 
      games_played = games_played + 1,
      games_won = games_won + CASE WHEN p_won THEN 1 ELSE 0 END,
      total_score = total_score + p_score,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id AND game_type = p_game_type;
  ELSE
    INSERT INTO game_stats (user_id, game_type, games_played, games_won, total_score)
    VALUES (p_user_id, p_game_type, 1, CASE WHEN p_won THEN 1 ELSE 0 END, p_score);
  END IF;
END;
11826 LANGUAGE plpgsql;
