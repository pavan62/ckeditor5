/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizeediting
 */

import type { ViewElement } from 'ckeditor5/src/engine';
import { type Editor, Plugin } from 'ckeditor5/src/core';
import ImageUtils from '../imageutils';
import ResizeImageCommand from './resizeimagecommand';

/**
 * The image resize editing feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 */
export default class ImageResizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageResizeEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'image', {
			resizeUnit: '%',
			resizeOptions: [ {
				name: 'resizeImage:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'resizeImage:25',
				value: '25',
				icon: 'small'
			},
			{
				name: 'resizeImage:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'resizeImage:75',
				value: '75',
				icon: 'large'
			} ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const resizeImageCommand = new ResizeImageCommand( editor );

		this._registerSchema();
		this._registerConverters( 'imageBlock' );
		this._registerConverters( 'imageInline' );

		// Register `resizeImage` command and add `imageResize` command as an alias for backward compatibility.
		editor.commands.add( 'resizeImage', resizeImageCommand );
		editor.commands.add( 'imageResize', resizeImageCommand );
	}

	private _registerSchema(): void {
		if ( this.editor.plugins.has( 'ImageBlockEditing' ) ) {
			this.editor.model.schema.extend( 'imageBlock', { allowAttributes: [ 'resizedWidth', 'resizedHeight' ] } );
		}

		if ( this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			this.editor.model.schema.extend( 'imageInline', { allowAttributes: [ 'resizedWidth', 'resizedHeight' ] } );
		}
	}

	/**
	 * Registers image resize converters.
	 *
	 * @param imageType The type of the image.
	 */
	private _registerConverters( imageType: 'imageBlock' | 'imageInline' ) {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( `attribute:resizedWidth:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, figure );
					viewWriter.addClass( 'image_resized', figure );
				} else {
					viewWriter.removeStyle( 'width', figure );
					viewWriter.removeClass( 'image_resized', figure );
				}
			} )
		);

		editor.conversion.for( 'dataDowncast' ).attributeToAttribute( {
			model: {
				name: imageType,
				key: 'resizedHeight'
			},
			view: modelAttributeValue => ( {
				key: 'style',
				value: {
					'height': modelAttributeValue
				}
			} )
		} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher =>
			dispatcher.on( `attribute:resizedHeight:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewImg = conversionApi.mapper.toViewElement( data.item );
				const target = imageType === 'imageInline' ? imageUtils.findViewImgElement( viewImg ) : viewImg;

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'height', data.attributeNewValue, target );
				} else {
					viewWriter.removeStyle( 'height', target );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: imageType === 'imageBlock' ? 'figure' : 'img',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'resizedWidth',
					value: ( viewElement: ViewElement ) => {
						return this._getStyleIfWidthAndHeightStylesSet( viewElement, 'width' );
					}
				}
			} );

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: imageType === 'imageBlock' ? 'figure' : 'img',
					styles: {
						height: /.+/
					}
				},
				model: {
					key: 'resizedHeight',
					value: ( viewElement: ViewElement ) => {
						return this._getStyleIfWidthAndHeightStylesSet( viewElement, 'height' );
					}
				}
			} );
	}

	/**
	 * Returns style (width or height) from the view element, if both styles (width and height) are set.
	 */
	private _getStyleIfWidthAndHeightStylesSet( viewElement: ViewElement, style: string ): string | null {
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );

		const widthStyle = imageUtils.getSizeInPx( viewElement.getStyle( 'width' ) );
		const heightStyle = imageUtils.getSizeInPx( viewElement.getStyle( 'height' ) );

		// If both image styles: width & height are set, they will override the image width & height attributes in the
		// browser. In this case, the image looks the same as if these styles were applied to attributes instead of styles.
		// That's why we can upcast these styles to width & height attributes instead of resizedWidth and resizedHeight.
		if ( widthStyle && heightStyle ) {
			return null;
		}

		return viewElement.getStyle( style )!;
	}
}
