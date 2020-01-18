
/**
 *
 * @param {object} params
 * @returns {string}
 */
module.exports.getVoidRegexp = function (params) {
	return params._void_regexp_ || '\\\/\\\*\\\* void \\\*\\\/';
}
/**
 *
 * @param {object} params
 * @returns {array}
 */
module.exports.getParams = function (params) {
	const _void_ = params._void_ || "/**" + " void " + "*/";
	const contentPhpNamespace = params.contentPhpNamespace || "<?php namespace tgrwb;\ndefined( 'ABSPATH' ) or die();";
	const contentJs = params.contentJs || "\nconst {name_for_js} = {};\nmodule.exports = {name_for_js};\n\n{name_for_js}.activate = function () {\n\tif (this._active) {\n\t\treturn this;\n\t} else {\n\t\tthis._active = true;\n\t}\n\ttry {\n\t\t\n\t\t{###_void_###}\n\t\t\n\t} catch (e) {\n\t\tconsole.error(e);\n\t}\n};\n";
	const contentOtherJs = "\n/* php */\n//require.context('./other/', true, /^.*\.(php)$/);\n\n{###_void_###}\n";
	const contentLess = params.contentLess || "\n.{base_class}{\n\t\n\t{###_void_###}\n\t\n}\n";
	const fileTemplates = params.fileTemplates || [
		// js
		{
			'name': '{name}--backend.js',
			'content': "{###contentJs###}",
			'is_shortcode': false
		},
		{
			'name': '{name}--frontend.js',
			'content': "{###contentJs###}",
			'is_shortcode': false
		},
		{
			'name': '{name}--login.js',
			'content': "{###contentJs###}",
			'is_shortcode': false
		},
		{
			'name': '{name}--other.js',
			'content': "{###contentOtherJs###}",
			'is_shortcode': false
		},
		// less
		{
			'name': '{name}--backend.less',
			'content': "{###contentLess###}",
			'is_shortcode': false
		},
		{
			'name': '{name}--frontend.less',
			'content': "{###contentLess###}",
			'is_shortcode': false
		},
		{
			'name': '{name}--login.less',
			'content': "{###contentLess###}",
			'is_shortcode': false
		},
		// php
		{
			'name': '{name}.php',
			'content': "{###contentPhpNamespace###}\n"
					+ "if( ! class_exists( __NAMESPACE__ . '\\\\' . '{class}', false ) ) {\n\t/**\n\t * Base class for this module.\n\t */\n\tclass {class} {\n\t\t\n\t\t{###_void_###}\n\t\t\n\t}\n}\n",
			'is_shortcode': false
		},
		{
			'name': '{name}-helper.php',
			'content': "{###contentPhpNamespace###}\nif( ! class_exists( __NAMESPACE__ . '\\\\' . '{class}Helper', false ) ) {\n\t/**\n\t * Helper for this module.\n\t */\n\tabstract class {class}Helper {\n\t\t\n\t\t{###_void_###}\n\t\t\n\t}\n}\n",
			'is_shortcode': false
		},
		{
			'name': 'other/{name}.php',
			'content': "{###contentPhpNamespace###}\n\n/**\n * File for theme.\n */\n\n{###_void_###}\n",
			'is_shortcode': false
		},
//		{
//			'name': 'trait-for-{name}.php',
//			'content': "{###contentPhpNamespace###}\nif( ! trait_exists( __NAMESPACE__ . '\\\\' . '{trait}', false ) ) {\n\t/**\n\t * Trait for ...\n\t */\n\ttrait {trait} {\n\t\t\n\t\t{###_void_###}\n\t\t\n\t}\n}\n",
//			'is_shortcode': false
//		},
		// php - shortcode
		{
			'name': 'other/shortcodes/{name}.php',
			'content': "{###contentPhpNamespace###}\n\n/**\n * Shortcode.\n *\n * <code>[{name_shortcode} param=\"\"]</code>\n */\n\n$attsDefault = [\n	'param' => '',\n];\n\n$atts = shortcode_atts( $attsDefault, $atts );\n\n$return = '';\n\n$return .= '<div class=\"{base_class}\">';\n\n{###_void_###}\n\n$return .= '';\n$return .= '</div>';\n\nreturn $return;\n",
			'is_shortcode': true
		},
		{
			'name': 'other/vc_configs/{name}.php',
			'content': "{###contentPhpNamespace###}\n\n/**\n * Configs for vc shortcode.\n */\n\n{###_void_###}\n",
			'is_shortcode': true
		},
		{
			'name': 'other/vc_params/{name}.php',
			'content': "{###contentPhpNamespace###}\n\n/**\n * Custom parameter for vc shortcode.\n */\n\n{###_void_###}\n",
			'is_shortcode': true
		},
		{
			'name': 'other/vc_templates/{name}.php',
			'content': "{###contentPhpNamespace###}\n\n/**\n * Vc shortcode.\n *\n * <code>[{name_shortcode} param=\"\"]</code>\n */\n\n$attsDefault = [\n\t'param' => '',\n];\n\n$atts = shortcode_atts( $attsDefault, $atts );\n\n$return = '';\n\n$return .= '<div class=\"{base_class}\">';\n\n{###_void_###}\n\n$return .= '';\n$return .= '</div>';\n\nreturn $return;\n",
			'is_shortcode': true
		}
	];
	if (params.fileTemplatesPlus) {
		[].push.apply(fileTemplates, params.fileTemplatesPlus);
	}
	return {_void_, contentPhpNamespace, contentJs, contentOtherJs, contentLess, fileTemplates};
};
