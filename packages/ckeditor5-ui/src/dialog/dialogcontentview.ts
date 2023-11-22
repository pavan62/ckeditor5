/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialogcontentview
 */

import View from '../view';
import type ViewCollection from '../viewcollection';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * TODO
 */
export default class DialogContentView extends View {
	/**
	 * A collection of content items.
	 */
	public readonly children: ViewCollection;

	/**
	 * TODO
	 */
	constructor(
		locale: Locale | undefined
	) {
		super( locale );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-dialog__content' ]
			},
			children: this.children
		} );
	}

	/**
	 * TODO
	 */
	public reset(): void {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}
	}
}
