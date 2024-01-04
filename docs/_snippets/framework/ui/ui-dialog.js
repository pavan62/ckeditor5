/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, ButtonView, DialogView, View, document */

const locale = new Locale();

const dialogButton = new ButtonView();
dialogButton.set( {
	label: 'Show a dialog',
	withText: true,
	class: 'ck-button-action'
} );
dialogButton.render();

let dialog;

dialogButton.on( 'execute', () => {
	if ( dialogButton.isOn ) {
		hideDialog( dialog );

		return;
	}

	dialogButton.isOn = true;

	dialog = new DialogView( locale, {
		getCurrentDomRoot: () => {},
		getViewportOffset: () => {}
	} );

	dialog.render();

	dialog.on( 'close', () => {
		hideDialog( dialog );
	} );

	dialog.set( {
		isVisible: true
	} );

	const textView = new View( locale );

	textView.setTemplate( {
		tag: 'div',
		attributes: {
			style: {
				padding: 'var(--ck-spacing-large)',
				whiteSpace: 'initial',
				width: '100%',
				maxWidth: '500px'
			},
			tabindex: -1
		},
		children: [
			`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
						dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
						commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
						nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
						anim id est laborum.`
		]
	} );

	dialog.setupParts( {
		title: 'Custom dialog',
		content: textView,
		actionButtons: [
			{
				label: 'OK',
				class: 'ck-button-action',
				withText: true,
				onExecute: () => hideDialog( dialog )
			}
		]
	} );

	document.body.append( dialog.element );
} );

document.querySelector( '.ui-dialog' ).append( dialogButton.element );

function hideDialog( dialog ) {
	dialog.contentView.reset();
	dialog.destroy();
	document.body.removeChild( dialog.element );
	dialogButton.isOn = false;
}
