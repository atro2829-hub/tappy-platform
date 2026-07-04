import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::test
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
export const test = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/admin/settings/integrations/{group}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::test
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
test.url = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: args.group,
    }

    return test.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::test
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
test.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::test
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
const testForm = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::test
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
testForm.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: test.url(args, options),
    method: 'post',
})

test.form = testForm

const integration = {
    test: Object.assign(test, test),
}

export default integration