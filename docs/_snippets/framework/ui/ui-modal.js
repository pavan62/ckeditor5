/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, ButtonView, DialogView, View, document */

const locale = new Locale();

const modalButton = new ButtonView();
modalButton.set( {
	label: 'Show a modal',
	withText: true,
	class: 'ck-button-action'
} );
modalButton.render();

let modal;

modalButton.on( 'execute', () => {
	if ( modalButton.isOn ) {
		hideModal( modal );

		return;
	}

	modalButton.isOn = true;

	modal = new DialogView( locale, {
		getCurrentDomRoot: () => {},
		getViewportOffset: () => {}
	} );

	modal.render();

	modal.on( 'close', () => {
		hideModal( modal );
	} );

	modal.set( {
		isVisible: true,
		isModal: true
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

	modal.setupParts( {
		title: 'Custom modal',
		content: textView,
		actionButtons: [
			{
				label: 'Ok!',
				class: 'ck-button-action',
				withText: true,
				onExecute: () => hideModal( modal )
			}
		]
	} );
	document.body.append( modal.element );
} );

document.querySelector( '.ui-modal' ).append( modalButton.element );

function hideModal( modal ) {
	modal.contentView.reset();
	modal.destroy();
	document.body.removeChild( modal.element );
	modalButton.isOn = false;
}
