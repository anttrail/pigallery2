import {Component, Input, OnChanges} from '@angular/core';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {RouterLink} from '@angular/router';
import {UserDTO} from '../../../../common/entities/UserDTO';
import {AuthenticationService} from '../../model/network/authentication.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {QueryService} from '../../model/query.service';
import {GalleryService} from '../gallery.service';
import {Utils} from '../../../../common/Utils';
import {SortingMethods} from '../../../../common/entities/SortingMethods';
import {Config} from '../../../../common/config/public/Config';
import {SearchResultDTO} from '../../../../common/entities/SearchResultDTO';
import {SearchTypes} from '../../../../common/entities/AutoCompleteItem';

@Component({
  selector: 'app-gallery-navbar',
  styleUrls: ['./navigator.gallery.component.css'],
  templateUrl: './navigator.gallery.component.html',
  providers: [RouterLink],
})
export class GalleryNavigatorComponent implements OnChanges {
  @Input() directory: DirectoryDTO;
  @Input() searchResult: SearchResultDTO;

  routes: NavigatorPath[] = [];
  SortingMethods = SortingMethods;
  sortingMethodsType: { key: number; value: string }[] = [];
  config = Config;
  DefaultSorting = Config.Client.Other.defaultPhotoSortingMethod;

  readonly SearchTypes = SearchTypes;

  constructor(private _authService: AuthenticationService,
              public queryService: QueryService,
              public galleryService: GalleryService,
              private i18n: I18n) {
    this.sortingMethodsType = Utils.enumToArray(SortingMethods);
  }


  ngOnChanges() {
    this.getPath();
  }

  getPath(): any {
    if (!this.directory) {
      return [];
    }

    const path = this.directory.path.replace(new RegExp('\\\\', 'g'), '/');

    const dirs = path.split('/');
    dirs.push(this.directory.name);

    // removing empty strings
    for (let i = 0; i < dirs.length; i++) {
      if (!dirs[i] || 0 === dirs[i].length || '.' === dirs[i]) {
        dirs.splice(i, 1);
        i--;
      }
    }

    const user = this._authService.user.value;
    const arr: NavigatorPath[] = [];

    // create root link
    if (dirs.length === 0) {
      arr.push({name: this.i18n('Images'), route: null});
    } else {
      arr.push({name: this.i18n('Images'), route: UserDTO.isPathAvailable('/', user.permissions) ? '/' : null});
    }

    // create rest navigation
    dirs.forEach((name, index) => {
      const route = dirs.slice(0, dirs.indexOf(name) + 1).join('/');
      if (dirs.length - 1 === index) {
        arr.push({name: name, route: null});
      } else {
        arr.push({name: name, route: UserDTO.isPathAvailable(route, user.permissions) ? route : null});
      }
    });


    this.routes = arr;


  }

  setSorting(sorting: SortingMethods) {
    this.galleryService.setSorting(sorting);
  }

  get ItemCount(): number {
    return (this.directory || this.searchResult).media.length;
  }

}

interface NavigatorPath {
  name: string;
  route: string;
}

