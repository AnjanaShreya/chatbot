const bcrypt = require('bcryptjs');
const prisma = require('../config/db'); 

class User {
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  static async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });
    return user.id;
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { password: hashedPassword }
    });
  }
}

module.exports = User;