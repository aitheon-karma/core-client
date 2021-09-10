import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreClientModule } from '@aitheon/core-client';
import { environment } from '../../environments/environment';

import { DesignSystemRoutingModule } from './design-system-routing.module';
import { DesignSystemComponent } from './design-system.component';

import { FormsComponent } from './forms/forms.component';
import { FormsInputsComponent } from './forms-inputs/forms-inputs.component';
import { SelectsButtonsComponent } from './selects-buttons/selects-buttons.component';
import { ColorsTypographyComponent } from './colors-typography/colors-typography.component';
import { ColorsComponent } from './colors/colors.component';
import { TypographyComponent } from './typography/typography.component';
import { SpacingComponent } from './spacing/spacing.component';
import { TabsModule } from 'ngx-bootstrap';
import { ElevationsComponent } from './elements/elevations/elevations.component';
import { HintsTooltipsComponent } from './components/hints-tooltips/hints-tooltips.component';
import { SwitchThemesComponent } from './themes/switch-themes/switch-themes.component';
import { InputsComponent } from './components/inputs/inputs.component';
import { IconsComponent } from './icons/icons.component';
import { AvatarsComponent } from './elements/avatars/avatars.component';
import { ButtonsComponent } from './components/buttons/buttons.component';
import { GridsComponent } from './grids/grids.component';
import { LinksComponent } from './elements/links/links.component';
import { ListsComponent } from './components/lists/lists.component';
import { StatesComponent } from './states/states.component';
import { SlidersComponent } from './components/sliders/sliders.component';
import { DialogsComponent } from './components/dialogs/dialogs.component';
import { SnackbarsComponent } from './components/snackbars/snackbars.component';
import { ChipsComponent } from './components/chips/chips.component';
import { BannersComponent } from './components/banners/banners.component';
import { SelectionControlsComponent } from './elements/selection-controls/selection-controls.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { IconComponent } from './icons/icon/icon.component';
import { GetFirstLettersPipe } from './components/inputs/inputs.component';


 
@NgModule({
  declarations: [
    DesignSystemComponent,
    FormsComponent,
    FormsInputsComponent,
    SelectsButtonsComponent,
    ColorsTypographyComponent,
    ColorsComponent,
    TypographyComponent,
    SpacingComponent,
    ElevationsComponent,
    HintsTooltipsComponent,
    SwitchThemesComponent,
    InputsComponent,
    IconsComponent,
    AvatarsComponent,
    ButtonsComponent,
    GridsComponent,
    LinksComponent,
    ListsComponent,
    StatesComponent,
    SlidersComponent,
    DialogsComponent,
    SnackbarsComponent,
    ChipsComponent,
    BannersComponent,
    SelectionControlsComponent,
    TabsComponent,
    IconComponent,
    GetFirstLettersPipe
  ],
  imports: [
    CommonModule,
    DesignSystemRoutingModule,
    TabsModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    CoreClientModule.forRoot({
      baseApi: environment.baseApi,
      production: environment.production,
    }),
  ]
})
export class DesignSystemModule { }
