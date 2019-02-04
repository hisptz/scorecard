# Angular4 DHIS menu module

This in an angular2/4 module to be used to add a top bar within DHIS apps.

# Installation

This component assumes that the angular app is created using [angular cli](https://cli.angular.io/).

To use this module add it as git submodule on your working directory (app directory for ng2/4 project) as follows:

`git submodule add git@github.com:hisptz/ng2-dhis-menu-module.git src/app/menu`

### Using Submodules

In order to fill in the submodule’s path with the files from the external repository, you must first initialize the submodules and then update them.

`git submodule init`

`git submodule update`

For more about git submodules click [here](https://chrisjean.com/git-submodules-adding-using-removing-and-updating/)

# Using menu module

In order to use menu module, import the module in your app.module.ts file as follows;

```
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MenuModule //Module for dhis2 menu
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
``` 

In your app component, add menu component as follows;

`<dhis-menu></dhis-menu>
`

DHIS2 menu is using fixed position so to be able to see your items you have to add the margin-top properties in your root component

# Update menu Submodule

If you want to pull new changes form menu repository, do as follows

1. Change to menu module directory

`cd src/app/menu`

2. Pull new changes from the repository for the stable branch (master)

`git pull origin master`

