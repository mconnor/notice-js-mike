# notice-js mike branch

## VAST 3 Icon

Google fixed the [IMA SDK][imassdk] so that now the _IFrameResource_ in [VAST 3][vast3] works.

The Icons node, calling our VAST tag, looks like:

```xml
<Icons>
    <Icon program="AdChoices" height="20" width="122" xPosition="518" yPosition="0">
        <IFrameResource>
            <![CDATA[//mconnor.github.io/testVast/iframe-durly.html?coid=242;nid=64545;position=top-right]]>
        </IFrameResource>
    </Icon>
</Icons>
```

*Note*
When our vast-iframe.html tag is implemented in DCM, the tag will pull a VAST XML with an \<Icons\> tag that uses *StaticResource*.  However, it still works.

Example:

```xml
<Icons>
    <Icon program="AdChoices" width="122" height="20" xPosition="RIGHT" yPosition="TOP">
        <StaticResource creativeType="">
        <![CDATA[//c.evidon.com/vast-iframe.html?;coid=242;nid=118889;position=top-right;
        ]]>
        </StaticResource>
    </Icon>
</Icons>
```

### XML attributes

#### width, height

This is the size of the iframe that will be the container for the icon. Note the iframe blocks click thrus to the ad. So the iframe should be only as large as need to contain the icon.

Note - IconClickThrough and IconClickTracking nodes are not used w/ IFrameResource

#### **xPosition, yPosition** - this will place the icon container

### Parameters

The _IFrameResource_ contains a link to vast-iframe.html with the following query string values attached.

* coid
* nid
* position - top-left, top-right, bottom-left, bottom-right. *Note* - this will put the icon in the appropriate corner of the iframe - not the ad. You must adjust the xPosition, yPosition attributes in the XML to get the icon to apear over the ad corectly. These are passed on to durly.js

### IFRAME

The *IFrameResource* links to an HTML page that parses the query string it called with and loads durly with the same query string values.  In addition it adds in the fixed size for the iframe size with ad_w, ad_h. So the durly link will look something like:

```html
https://mconnor.github.io/notice-js-mike/surly/durly.js?;coid=242;nid=64545;ad_w=122;ad_h=30;position=top-left
```

Pop this [Vast 3 Demo][vastdemo] into the [IMA VAST validator][vastvalidator]

## Responding to resizing ads

See the icon on [ad that changes size][resize]

[vastdemo]:https://mconnor.github.io/testVast/vast-icon-iframe-resource.xml
[vast3]:https://www.iab.net/media/file/VASTv3.0.pdf
[imassdk]:https://developers.google.com/interactive-media-ads/docs/sdks/html5/
[vastvalidator]:https://developers.google.com/interactive-media-ads/docs/sdks/html5/vastinspector
[resize]:https://mconnor.github.io/notice-js-mike/s