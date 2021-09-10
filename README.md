## Core client

## Install dependencies
 ```
 npm i
 cd projects/aitheon/core-client
 npm i
 cd ../../..
```

## 1. Build and watch lib
```
sudo npm run watch
```

(if you are using Linux and got ENOSPC error, make sure to reset maximum amount of watchers)

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

Wait lib to build and start watching changes and **only then go to step 2**


## 2. Development server
Run for a dev server. 
 ```
ng serve
``` 
Navigate to `http://localhost:4200/`.
The app will automatically reload if you change any of the source files.


## How to guides

### Main structure
- `src` - folder of demo application. Used to show all controls and themes from library
- `projects/aitheon/core-client` - Core library with components and themes styling.
- `dist` - library build result 

### Structure of `projects/aitheon/core-client/src` 

- `public_api.ts` - must export any service or component that will public available for library.
- `assets` - folderc ontains all core images, fonts and etc. files. All content of this folder will be copied to microservice assets folder during a build.
- `lib/core-client.options.ts` - optional options that pass to core library
- `lib` - this is a main library folder with components, services and etc. It's devided not by modules, but by types such as services, pipes, directives and etc.

### Demo application
- Must demonstate all possible states of elements/components, as example `buttons` component require to demonstrate all posible button sizes (`.btn-lg, btn-sm` and etc.) and variants with icons, etc.


### Themes.
All styles and themes is at `projects/aitheon/core-client/styles` folder
- `main.scss` - contains css/scss links to angular and etc, libraries 
- `core` - folder contains general elements styles, such as tabs, checkboxes and etc.
used in this library and a link to to `core/core.scss`
- `core/core.scss` - contains all core styles/animations and link to bootstrap to be able override it's variables
- `core/_variables.scss` - contains z-index, size or different elements if they static, common background and etc. Must not include colors or etc theme related variable that is used in themes, to avoid dublicate.
- `themes` - folder for themes. Any elements that need special theme styling such drive-uploader, tabs or etc. will be here, as example `themes/${theme-name}/_tabs.scss`
- `themes/${theme-name}` - folder with all theme styles. Always as a root file must have `themes/${theme-name}/${theme-name}.scss` file. 
- `themes/${theme-name}/_variables.scss` - colors, background variables for theme

#### Create or modify theme
- variable names must be **lower-case**, as example: `$brand-primary`;
- all colors, background and etc. must be variables
- class naming: when it's possible class name must be as general as possible. As example, theme must not include class name `top-left-user-header-used-only-here`, just make it as `top-header` and `user-header` that will just modify some small things.
- class naming: **don't create too spesific classes**. 
example of **BAD** classes
```
.pt-7{
  padding-top: 7px;
}
.pt-8 {
  padding-top: 8px;
}
.bg-d3d3d3 {
  background: #d3d3d3;
}
```
better will be
```
.pad-sm{
    padding-top: 7px;
}
.pad-md {
    ... etc
}
.light-background {
    ...
}
```


#### How to switch theme or get change event
- Core library includes `ThemesService`. 
- Theme switching is already implemented in header, to switch it from other code `themesService.switchTheme()`
- Example of of theme changed event.
```
import { ThemesService } from '@aitheon/core-client';
...
constructor(
    private themesService: ThemesService,
  ) {
    this.themesService.themeChanged.subscribe((theme: any) => {
      console.log('theme:', theme);
    });
  }
```

Any theme except `default` need to have all style under `${theme-name}` class for `body` element. as example, `dark` theme styles for button.
```
body.dark {
    .btn-primary {
        // styles
    }
}
```

#### Styling components at microservices level
When need to apply some styles to component elements at microservice, you can use theme variables, as example, for `dashboard`

**dashboard.component.ts**
include `${component-name}.${theme-name}.scss` file and add it to styleUrls
```
@Component({
  selector: 'ai-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.scss',
    './dashboard.component.dark.scss'
  ]
})
```

**dashboard.component.dark.scss**

You can import `variables` for corresponding theme and core variables, as in example below, **path to node_modules need to match your component folder level**.

At this example, class `.btn-cool-user` will have a `$brand-primary` color from `dark` theme when `body` will be with class `dark`
```
// contains size and index
@import '../../../node_modules/@aitheon/core-client/styles/core/variables';
// colors and theme related staff
@import '../../../node_modules/@aitheon/core-client/styles/themes/dark/variables';

:host-context(.dark) {
    .btn-cool-user {
        color: $brand-primary;
    }
}
```


#### How theme file included to page
At `index.html` file there is link to compiled css file. Link to selected theme is changed at `ThemesService` at this library.
```
<link rel="stylesheet" id="css-theme" href="styles/themes/default/default.css" />
```

### Library Version changes manifest
- MAJOR version when you make breacking API changes, Angular major version up
- MINOR version when you add functionality in a backwards-compatible manner. New components or it's updates.
- PATCH version when you make backwards-compatible bug fixes.

### Publish lib
Before publish need to version up library following above rules at file `projects/aitheon/core-client/package.json` 
```
npm run pub:lib
```
