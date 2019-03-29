import { AuthenticationError, UserInputError } from 'apollo-server-express'
import * as Sequelize from 'sequelize'
import { IContext, IUser } from '../common/interfaces'
import { createLog } from '../common/log'
import { decodeToken, generateToken } from '../common/utils'

const log = createLog('user_resolver')

export default {
  Mutation: {
    signIn: async (_: any, { name, password }: { name: string, password: string }, { res, db }: IContext):
      Promise<{ token: string, name: string }> => {
      const user = await db.user.findOne({
        attributes: ['name', 'password', 'email', 'phone', 'id'],
        where: {
          name: {
            [Sequelize.Op.eq]: name,
          },
        },
      })
      if (!user) throw new UserInputError('Authentication failed. User not found.')
      const isCorrectPassword = await user.validatePassword(password)
      if (!isCorrectPassword) throw new AuthenticationError('Authentication failed. Invalid password.')
      const token = await generateToken(user)
      res.cookie('token', token, {
        expires: new Date(Date.now() + 3 * 86400000),
        // httpOnly: true
      })
      return { token, name }
    },
    signOut: (_: any, __: any, { res }: IContext): boolean => {
      res.cookie('token', '', {
        httpOnly: true,
      })
      return true
    },
    signUp: async (_: any, userInfo: IUser, { res, db }: IContext): Promise<{ token: string, name: string}> => {
      const user = await db.user.create(userInfo)
      const token = await generateToken(user)
      res.cookie('token', token, {
        expires: new Date(Date.now() + 3 * 86400000),
        httpOnly: true,
      })
      return { token, name: userInfo.name }
    },
  },
  Query: {
    user: (_: any, { id }: { id: number }, { db }: IContext): Promise<IUser> => db.user.findByPk(id),
    userByName: (_: any, { name }: {name: string}, { db }: IContext): Promise<IUser> => db.user.findOne({
      where: {
        name: {
          [Sequelize.Op.eq]: name,
        },
      },
    }),
    userInfo: async (_: any, __: any, { req }: IContext): Promise<any> => {
      const { token } = req.cookies
      try {
        return decodeToken(token)
      } catch (e) {
        return {}
      }
    },
  },
  User: {
    password: () => '*******',
  },
}
