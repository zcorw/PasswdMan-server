// 缓存 KEY 枚举
export enum CacheEnum {
  /**
   * 登录用户
   */
  LOGIN_TOKEN_KEY = 'login_tokens:',
}

// 角色枚举
export enum RoleEnum {
  /**
   * 管理员
   */
  ADMIN = 'admin',
  /**
   * 普通用户
   */
  NORMAL = 'normal',
}

/**
 * 删除标志
 */
export enum DelFlagEnum {
  /**
   * 存在
   */
  NOTDELETED = 'n',
  /**
   * 删除
   */
  DELETEED = 'y',
}

// 状态枚举
export enum StatusEnum {
  /**
   * 正常
   */
  ACTIVE = 'active',
  /**
   * 停用
   */
  DISABLED = 'disabled',
}
