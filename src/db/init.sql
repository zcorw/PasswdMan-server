create table user (
    user_id bigint(20) not null auto_increment comment '用户ID', user_name varchar(30) not null comment '用户账号', password varchar(100) default '' comment '密码', salt varchar(64) default '' comment '盐加密', status char(1) default '0' comment '帐号状态（0正常 1停用）', del_flag char(1) default '0' comment '删除标志（0代表存在 2代表删除）', login_date datetime comment '最后登录时间', create_by varchar(64) default '' comment '创建者', create_time datetime comment '创建时间', update_by varchar(64) default '' comment '更新者', update_time datetime comment '更新时间', remark varchar(500) default null comment '备注', primary key (user_id)
) engine = innodb auto_increment = 100 comment = '用户信息表';

-- ----------------------------
-- 初始化-用户信息表数据
-- ----------------------------
insert into
    user
values (
        1, 'admin', '123456', '0', '0', sysdate(), 'admin', sysdate(), '', null, '管理员'
    );