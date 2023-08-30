/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/autocomplete/autocompleteview
*/

import { getOptimalPosition, type PositioningFunction, type Locale } from '@ckeditor/ckeditor5-utils';
import SearchView, { type SearchViewConfig } from '../search/searchview';
import type SearchResultsView from '../search/searchresultsview';

import '../../theme/components/autocomplete/autocomplete.css';

/**
 * TODO
 */
export default class AutocompleteView extends SearchView {
	constructor( locale: Locale, config: SearchViewConfig ) {
		super( locale, config );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-autocomplete' ]
			}
		} );

		const resultsView = this.resultsView as AutocompleteResultsView;
		const bindResultsView = resultsView.bindTemplate;

		resultsView.set( 'isVisible', false );
		resultsView.set( 'position', 's' );

		resultsView.extendTemplate( {
			attributes: {
				class: [
					bindResultsView.if( 'isVisible', 'ck-hidden', value => !value ),
					bindResultsView.to( 'position', value => `ck-search__results_${ value }` )
				]
			}
		} );

		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			resultsView.isVisible = isFocused;

			resultsView.position = AutocompleteView._getOptimalPosition( {
				element: this.resultsView.element!,
				target: this.searchFieldView.element!,
				fitInViewport: true,
				positions: AutocompleteView._resultsPositions
			} ).name as AutocompleteResultsView[ 'position' ];

			if ( !isFocused ) {
				this.searchFieldView.reset();
			}
		} );
	}

	/**
	 * A function used to calculate the optimal position for the dropdown panel.
	 */
	private static _getOptimalPosition = getOptimalPosition;

	/**
	 * TODO
	 */
	private static _resultsPositions: Array<PositioningFunction> = [
		fieldRect => {
			return {
				top: fieldRect.bottom,
				left: fieldRect.left,
				name: 's'
			};
		},
		( fieldRect, resultsRect ) => {
			return {
				top: fieldRect.top - resultsRect.height,
				left: fieldRect.left,
				name: 'n'
			};
		}
	];
}

/**
 * TODO
 */
interface AutocompleteResultsView extends SearchResultsView {

	/**
	 * TODO
	 */
	isVisible: boolean;

	/**
	 * TODO
	 */
	position: 's' | 'n';
}
