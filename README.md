# Challenge Code Frontend

这个 Challenge Code 项目的前端部分，基于 [vue-vben-admin v5.6.0](https://github.com/vbenjs/vue-vben-admin/releases/tag/v5.6.0) 版本进行开发。

## Commands

```bash
# Install dependencies
cd vue-vben-admin
npm i -g corepack
pnpm install

# run
pnpm dev

# build
pnpm build
```

## Design

用户角色：

- 系统管理员：拥有最高权限，可以管理所有组和用户，修改系统设置。
- 组管理员：可以管理自己所在组的用户和信息，但不能修改系统设置。
- 组用户：只能查看和修改自己的信息，不能管理其他用户或系统设置。

页面设计：

- 登录页面：可以使用用户名密码及SSO登录。
- 系统设置页面：系统管理员可以配置系统参数和权限设置。
- Log页面：记录用户登录和操作日志，供系统管理员查看。
- 用户管理页面：系统管理员可以查看和管理所有用户，组管理员只能管理自己所在组的用户。
- Challenge Code 生成页面：用户可以输入或上传图片，系统会生成对应的 Challenge Code。  
