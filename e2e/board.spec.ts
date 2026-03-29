import { test, expect } from '@playwright/test'

test.describe('Kanban Board', () => {
  test('Guest session is created automatically', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 15000 })
  })

  test('User can create a task', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('add-task-todo').click()
    await page.getByTestId('task-title-input').fill('Test Task E2E')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Test Task E2E')).toBeVisible({ timeout: 10000 })
  })

  test('Search filters tasks correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('add-task-todo').click()
    await page.getByTestId('task-title-input').fill('Searchable Task')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Searchable Task')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('search-input').fill('Searchable')
    await expect(page.getByText('Searchable Task')).toBeVisible()
  })

  test('Task modal opens on click', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('add-task-todo').click()
    await page.getByTestId('task-title-input').fill('Modal Task')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Modal Task')).toBeVisible({ timeout: 10000 })
    // Wait for optimistic task to be replaced by real one from Supabase
    await page.waitForTimeout(2000)
    await page.getByTestId('task-card').filter({ hasText: 'Modal Task' }).click()
    await expect(page.getByTestId('task-modal')).toBeVisible({ timeout: 5000 })
  })
})
