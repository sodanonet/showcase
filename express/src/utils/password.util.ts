import bcrypt from "bcryptjs";

/**
 * Hashes a plain text password
 * @param password - The plain password to hash
 * @returns A hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain password with a hashed password
 * @param password - The plain password
 * @param hashedPassword - The hashed password from DB
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
