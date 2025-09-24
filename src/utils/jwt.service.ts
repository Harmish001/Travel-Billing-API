const jwt = require("jsonwebtoken");

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface ResetTokenPayload {
  userId: string;
  type: string;
}

class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || "your-default-secret-key";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.secret) as JWTPayload;
  }

  generateResetToken(userId: string): string {
    return jwt.sign({ userId, type: "reset" }, this.secret, {
      expiresIn: "1h",
    });
  }

  verifyResetToken(token: string): ResetTokenPayload {
    const decoded = jwt.verify(token, this.secret) as ResetTokenPayload;

    if (decoded.type !== "reset") {
      throw new Error("Invalid reset token");
    }

    return decoded;
  }
}

export default new JWTService();
