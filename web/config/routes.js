export default [
  {
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      {
        exact: true,
        name: 'landing',
        path: '/index',
        wrappers: ['@/wrappers/LandingWrappers'],
        component: './Landing'
      },
      {
        path: '/app',
        component: '../layouts/BasicLayout',
        wrappers: ['@/wrappers/Citizen'],
        routes: [
          {
            path: '/app',
            redirect: '/app/car-register'
          },
          {
            exact: true,
            name: 'RegistryCar',
            icon: 'FormOutlined',
            path: '/app/car-register',
            component: './CarRegister'
          },
          {
            exact: true, 
            name: "ChangeOwner",
            icon: 'SwapRightOutlined',
            path: '/app/change-owner',
            component: './ChangeOwner'
          },
          {
            exact: true, 
            name: "RegisteredCar",
            icon: 'CarOutlined',
            path: '/app/registered-car',
            component: './RegisteredCar'
          },
          {
            exact: true, 
            name: "profile",
            icon: 'UserOutlined',
            path: '/app/profile',
            component: './Profile'
          },
          // {
          //   exact: true, 
          //   name: "help",
          //   icon: 'QuestionCircleOutlined',
          //   path: '/app/help',
          //   component: './RegisteredCar'
          // },
          // {
          //   name: 'list.table-list',
          //   icon: 'table',
          //   path: '/list',
          //   component: './ListTableList',
          // },
          {
            component: './404',
          },
        ],
      },
      {
        path: '/police',
        component: '../layouts/BasicLayout',
        wrappers: ['@/wrappers/Police'],
        routes: [
          {
            path: '/police',
            redirect: '/police/manage-registration'
          },
          {
            exact: true,
            path: '/police/manage-registration',
            component: './ManageReg',
            icon: 'CarOutlined',
            name: "manage-reg"
          },{
            exact: true,
            path: '/police/manage-citizen',
            name: 'manage-citizen',
            icon: 'TeamOutlined',
            component: './ManageCitizen',
          },
          {
            path: '/police/read-registration/:id',
            component: './DetailRegistration',
            name: 'read',
            hideInMenu: true,
          },
          {
            exact: true, 
            name: "profile",
            icon: 'UserOutlined',
            path: '/police/profile',
            component: './Profile'
          },
          // {
          //   exact: true, 
          //   name: "help",
          //   icon: 'QuestionCircleOutlined',
          //   path: '/police/help',
          //   component: './RegisteredCar'
          // },
        ]
      },{
        path: '/admin',
        component: '../layouts/BasicLayout',
        wrappers: ['@/wrappers/Admin'],
        routes: [
          {
            path: '/admin',
            redirect: '/admin/manager-user'
          },
          {
            exact: true,
            path: '/admin/manager-user',
            component: './ManageUser',
            name: 'manage-user'
          },
          {
            exact: true,
            path: '/admin/manager-city',
            component: './ManageCity',
            name: 'manage-city'
          },
          // {
          //   exact: true,
          //   path: '/admin/analysis',
          //   component: './Analysis',
          //   name: 'analysis'
          // }
        ]
      },
      {
        path: '/404',
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },

];
