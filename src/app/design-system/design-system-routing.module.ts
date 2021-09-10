import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DesignSystemComponent } from './design-system.component';
import { FormsComponent } from './forms/forms.component';
import { FormsInputsComponent } from './forms-inputs/forms-inputs.component';
import { SelectsButtonsComponent } from './selects-buttons/selects-buttons.component';
import { ColorsTypographyComponent } from './colors-typography/colors-typography.component';
import { ColorsComponent } from './colors/colors.component';
import { TypographyComponent } from './typography/typography.component';
import { SpacingComponent } from './spacing/spacing.component';
import { ElevationsComponent } from './elements/elevations/elevations.component';
import { HintsTooltipsComponent } from './components/hints-tooltips/hints-tooltips.component';
import { InputsComponent } from './components/inputs/inputs.component';
import { IconsComponent } from './icons/icons.component';
import { AvatarsComponent } from './elements/avatars/avatars.component';
import { ButtonsComponent } from './components/buttons/buttons.component';
import { GridsComponent } from './grids/grids.component';
import { LinksComponent } from './elements/links/links.component';
import { ListsComponent } from './components/lists/lists.component';
import { StatesComponent } from './states/states.component';
import { SlidersComponent } from './components/sliders/sliders.component';
import { BannersComponent } from './components/banners/banners.component';
import { SelectionControlsComponent } from './elements/selection-controls/selection-controls.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { SwitchThemesComponent } from './themes/switch-themes/switch-themes.component';
import { DialogsComponent } from './components/dialogs/dialogs.component';
import { SnackbarsComponent } from './components/snackbars/snackbars.component';
import { ChipsComponent } from './components/chips/chips.component';

const routes: Routes = [
  {
    path: 'design-system',
    component: DesignSystemComponent,
    children: [
      {
        path: 'forms', component: FormsComponent
      },
      {
        path: 'forms-inputs', component: FormsInputsComponent
      },
      {
        path: 'selects-buttons', component: SelectsButtonsComponent
      },
      {
        path: 'colors-typography', component: ColorsTypographyComponent
      },
      {
        path: 'colors', component: ColorsComponent
      },
      {
        path: 'icons', component: IconsComponent
      },
      {
        path: 'typography', component: TypographyComponent
      },
      {
        path: 'spacing', component: SpacingComponent
      },
      {
        path: 'elevations', component: ElevationsComponent
      },
      {
        path: 'hints-tooltips', component: HintsTooltipsComponent
      },
      {
        path: 'switch-themes', component: SwitchThemesComponent
      },
      {
        path: 'inputs', component: InputsComponent
      },
      {
        path: 'avatars', component: AvatarsComponent
      }
      ,
      {
        path: 'buttons', component: ButtonsComponent
      },
      {
        path: 'grids', component: GridsComponent
      },
      {
        path: 'links', component: LinksComponent
      },
      {
        path: 'lists', component: ListsComponent
      },
      {
        path: 'states', component: StatesComponent
      },
      {
        path: 'sliders', component: SlidersComponent
      },
      {
        path: 'dialogs', component: DialogsComponent
      },
      {
        path: 'snackbars', component: SnackbarsComponent
      },
      {
        path: 'chips', component: ChipsComponent
      },
      {
        path: 'banners', component: BannersComponent
      },
      {
        path: 'selection-controls', component: SelectionControlsComponent
      },
      {
        path: 'tabs', component: TabsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesignSystemRoutingModule { }
