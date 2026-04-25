export interface UserInfo {
  id: number;
  password: string;
  realName: string;
  roles: string[];
  username: string;
  groupId: string;
  status: 'active' | 'disabled';
  email: string;
  validUntil: string;
  homePath?: string;
}

export interface GroupInfo {
  id: string;
  name: string;
  description?: string;
}

export const ROLE_SYSTEM_ADMIN = 'system-admin';
export const ROLE_GROUP_ADMIN = 'group-admin';
export const ROLE_GROUP_USER = 'group-user';

export const MOCK_GROUPS: GroupInfo[] = [
  { id: 'group-a', name: '研发组', description: '前端与后端开发团队' },
  { id: 'group-b', name: '测试组', description: '质量保证与测试团队' },
  { id: 'group-c', name: '运维组', description: '系统运维与部署团队' },
];

export const MOCK_USERS: UserInfo[] = [
  {
    id: 1,
    username: 'sysadmin',
    password: '123456',
    realName: 'System Admin',
    roles: [ROLE_SYSTEM_ADMIN],
    groupId: 'platform',
    status: 'active',
    email: 'sysadmin@company.com',
    validUntil: '2030-12-31',
    homePath: '/challenge-code',
  },
  {
    id: 2,
    username: 'groupadmin',
    password: '123456',
    realName: '研发组管理员',
    roles: [ROLE_GROUP_ADMIN],
    groupId: 'group-a',
    status: 'active',
    email: 'groupadmin@company.com',
    validUntil: '2026-12-31',
    homePath: '/challenge-code',
  },
  {
    id: 3,
    username: 'dev_user1',
    password: '123456',
    realName: '张三',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-a',
    status: 'active',
    email: 'zhangsan@company.com',
    validUntil: '2026-06-30',
    homePath: '/profile',
  },
  {
    id: 4,
    username: 'dev_user2',
    password: '123456',
    realName: '李四',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-a',
    status: 'disabled',
    email: 'lisi@company.com',
    validUntil: '2025-03-31',
    homePath: '/profile',
  },
  {
    id: 5,
    username: 'dev_user3',
    password: '123456',
    realName: '王五',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-a',
    status: 'active',
    email: 'wangwu@company.com',
    validUntil: '2027-01-15',
    homePath: '/profile',
  },
  {
    id: 6,
    username: 'qa_admin',
    password: '123456',
    realName: '测试组管理员',
    roles: [ROLE_GROUP_ADMIN],
    groupId: 'group-b',
    status: 'active',
    email: 'qa.admin@company.com',
    validUntil: '2026-12-31',
    homePath: '/challenge-code',
  },
  {
    id: 7,
    username: 'qa_user1',
    password: '123456',
    realName: '赵六',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-b',
    status: 'active',
    email: 'zhaoliu@company.com',
    validUntil: '2026-09-30',
    homePath: '/profile',
  },
  {
    id: 8,
    username: 'qa_user2',
    password: '123456',
    realName: '孙七',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-b',
    status: 'active',
    email: 'sunqi@company.com',
    validUntil: '2025-12-31',
    homePath: '/profile',
  },
  {
    id: 9,
    username: 'ops_user1',
    password: '123456',
    realName: '周八',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-c',
    status: 'active',
    email: 'zhouba@company.com',
    validUntil: '2026-03-31',
    homePath: '/profile',
  },
  {
    id: 10,
    username: 'ops_user2',
    password: '123456',
    realName: '吴九',
    roles: [ROLE_GROUP_USER],
    groupId: 'group-c',
    status: 'disabled',
    email: 'wujiu@company.com',
    validUntil: '2025-06-30',
    homePath: '/profile',
  },
];

export const MOCK_CODES = [
  {
    username: 'sysadmin',
    codes: [
      'USER:VIEW:ALL',
      'USER:CREATE',
      'USER:UPDATE',
      'USER:DELETE',
      'GROUP:VIEW:ALL',
      'GROUP:MANAGE',
      'SYSTEM:SETTINGS',
      'LOG:VIEW',
      'CHALLENGE:GENERATE',
    ],
  },
  {
    username: 'groupadmin',
    codes: [
      'USER:VIEW:GROUP',
      'USER:CREATE:GROUP',
      'USER:UPDATE:GROUP',
      'GROUP:VIEW:SELF',
      'GROUP:MANAGE:SELF',
      'CHALLENGE:GENERATE',
    ],
  },
  {
    username: 'groupuser',
    codes: ['USER:VIEW:SELF', 'USER:UPDATE:SELF', 'CHALLENGE:GENERATE'],
  },
];

const baseMenus = [
  {
    name: 'ChallengeCode',
    path: '/challenge-code',
    component: '/challenge-code/index',
    meta: {
      icon: 'mdi:creation',
      title: 'Challenge Code',
    },
  },
];

export const MOCK_MENUS = [
  {
    username: 'sysadmin',
    menus: [
      ...baseMenus,
      {
        name: 'SystemSettings',
        path: '/system-settings',
        component: '/system/settings/index',
        meta: {
          icon: 'carbon:settings',
          title: 'System Settings',
        },
      },
      {
        name: 'LogCenter',
        path: '/logs',
        component: '/logs/index',
        meta: {
          icon: 'carbon:ibm-cloud-logs',
          title: 'Logs',
        },
      },
      {
        name: 'UserManagement',
        path: '/users',
        component: '/users/index',
        meta: {
          icon: 'carbon:user-multiple',
          title: 'User Management',
        },
      },
    ],
  },
  {
    username: 'groupadmin',
    menus: [
      ...baseMenus,
      {
        name: 'GroupUserManagement',
        path: '/users',
        component: '/users/index',
        meta: {
          icon: 'carbon:user-role',
          title: 'Group Users',
        },
      },
    ],
  },
  {
    username: 'groupuser',
    menus: [
      ...baseMenus,
      {
        name: 'UserProfile',
        path: '/profile',
        component: '/profile/index',
        meta: {
          icon: 'carbon:user-avatar',
          title: 'My Profile',
        },
      },
    ],
  },
];
