import { verify } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";

interface Context {
  token?: string;
}

const AuthenticationAssurance: AuthChecker<Context> = ({
  context,
}: {
  context: Context;
}): boolean => {
  const authHeader = context.token;

  if (!authHeader) return false;

  const [, token] = authHeader.split(" ");

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const decrypted = verify(token, secret!);
    return !!decrypted;
  } catch {
    return false;
  }
};

export default AuthenticationAssurance;
