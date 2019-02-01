import * as bcrypt from 'bcryptjs'
import * as Sequelize from 'sequelize'
import { parseJSON } from '../common/utils'
import etc from '../etc'

const SALT_ROUND = etc.saltRounds

const opt = {
  createdAt: 'gmt_created',
  defaultScope: {
    limit: 100,
    offset: 0,
    where: {
      is_deleted : {
        [Sequelize.Op.eq]: 0,
      },
    },
  },
  freezeTableName: true,
  indexes: [
    {
      fields: ['email'],
      name: 'email_idx',
    },
    {
      fields: ['phone'],
      name: 'phone_idx',
    },
  ],
  timestamps: true,
  updatedAt: 'gmt_modified',
}
export default (sequelize: Sequelize.Instance<any>, dataTypes: Sequelize.DataTypes) => {
  const userModel = (sequelize as any).define(
    'user',
    {
      email : {
        allowNull : false,
        comment   : '用户邮箱',
        type      : dataTypes.STRING(128),
        unique    : 'user_name',
        validate  : {
          isEmail : true,
        },
      },
      id : {
        autoIncrement : true,
        comment       : '主键id',
        primaryKey    : true,
        type          : dataTypes.BIGINT(20).UNSIGNED,
      },
      is_deleted : {
        allowNull    : false,
        comment      : '0 表示未删除 1表示已删除',
        defaultValue : 0,
        type         : dataTypes.INTEGER(1),
      },
      name : {
        allowNull : false,
        comment   : '用户名',
        type      : dataTypes.STRING(128),
        unique    : 'user_name',
      },
      password : {
        allowNull : false,
        comment   : '用户password',
        type      : dataTypes.STRING(1024),
      },
      phone: {
        allowNull : false,
        comment   : '用户手机',
        type      : dataTypes.STRING(11),
        validate : {
          isPhoneNum(phone: string) {
            if (!(/^1[34578]\d{9}$/.test(phone))) throw new Error('手机号码有误，请重填')
          },
        },
      },
      setting: {
        comment : '用户设置',
        type : dataTypes.TEXT('long'),
        get() {
          const data = parseJSON((this as any).getDataValue('setting'))
          return data
        },
        set(setVal: string | object) {
          let setting = setVal
          if (setting && typeof setting !== 'string') {
            setting = JSON.stringify(setting)
          }
          return (this as any).setDataValue('setting', setting || '{}')
        },
      },
    },
    opt)

  const passwordHook = async (user: any) => {
    user.password = await user.generatePasswordHash()
  }

  userModel.beforeCreate(passwordHook)
  userModel.beforeUpdate(passwordHook)

  userModel.prototype.generatePasswordHash = async function () {
    return bcrypt.hash(this.password, SALT_ROUND)
  }

  userModel.prototype.validatePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password)
  }

  return userModel
}
