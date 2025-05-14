/*
  # Naprawienie polityk bezpieczeństwa dla tabeli user_profiles

  1. Zmiany
    - Włączenie RLS dla tabeli user_profiles
    - Dodanie polityk umożliwiających:
      - Tworzenie profilu przez nowego użytkownika
      - Aktualizację własnego profilu
      - Przeglądanie wszystkich profili
*/

-- Włączenie RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Polityka dla tworzenia profilu
CREATE POLICY "Users can create their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Polityka dla aktualizacji profilu
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Polityka dla odczytu profili
CREATE POLICY "Anyone can view profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (true);