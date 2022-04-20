import { config } from 'dotenv'

config()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugin = (_: unknown, config: any) => {
  config.env.test_username = process.env.hr_test_username
  config.env.test_password = process.env.hr_test_password
  config.env.test_role = process.env.hr_test_role
  config.env.admin_username = process.env.admin_username
  config.env.admin_password = process.env.admin_password
  config.env.manager_username = process.env.manager_username
  config.env.manager_password = process.env.manager_password
  config.env.employee_username = process.env.employee_username
  config.env.employee_password = process.env.employee_password
  return config
}

export default plugin
