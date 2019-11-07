// https://www.imooc.com/article/25369  demo
// https://www.jianshu.com/p/cd618edc11a8

import React from 'react'
import CssModules from 'react-css-modules'
import realationStyle from '@scss/relationWorkSpace.scss'

import * as d3 from "d3";


import conf from '@configs/chart.config.js'
import {getRelation} from './services.js'
class RelationWorkspace extends React.PureComponent {
    constructor(props) {
        super(props)
        this.dependsNode = []
        this.dependsLinkAndText = [];
        this.svg = ''
        this.data = {}
        this.dragable = false
    }
    state = {
        curBtn: '',
    }
    _force = () => {
        let {width, height, chargeStrength, collide, alphaDecay} = conf

        // 定义一个模拟的力的环境
        return d3.forceSimulation([])
            // simulation.force(name,[force])函数，添加某种力
            .force("line", d3.forceLink([]).id((d) => (d.id)).distance(300))
            // Creates a new many-body force with the default parameters.
            .force("charge", d3.forceManyBody().strength(chargeStrength))
            // Creates a new centering force with the specified x- and y- coordinates. If x and y are not specified, they default to ⟨0,0⟩.
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            // Creates a new circle collision force with the specified radius. If radius is not specified, it defaults to the constant one for all nodes.
            .force("collide", d3.forceCollide(collide).strength(0.2).iterations(5))
            .alphaDecay(alphaDecay)
    }
    _svg = (wrapperId) => {
        let {width, height, scaleExtent} = conf
        d3.select(`#${wrapperId}`).select("*").remove();
        let zoom = d3.zoom()
            .scaleExtent(scaleExtent)
            .on("zoom", () => {svg.attr("transform", () => (d3.event.transform))});

        let svg = d3.select(`#${wrapperId}`)
            .append("svg:svg")
            .attr("id", "J_SvgView")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .on("dblclick.zoom", null)
            .append("svg:g")
            .attr('class', "all")
            .attr("data-width", width)
            .attr("data-height", height)


        let arrow = svg.append("svg:defs")
            .selectAll("marker")

        arrow.data(["start-arrow"]).enter().append("svg:marker")
            .attr("id", d => d)
            .attr('class', 'arrow')
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", -7)
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 16)
            .attr("markerUnits", "userSpaceOnUse")
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,0L10,5L10,-5")
            .attr('fill', '#666');

        arrow.data(["end-arrow"]).enter().append("svg:marker")
            .attr("id", d => d)
            .attr('class', 'arrow')
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", conf.r + conf.strokeWidth + 10 / Math.sqrt(2))
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 16)
            .attr("markerUnits", "userSpaceOnUse")
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr('fill', '#666');

        return svg;
    }
    _drag = (force) => {
        // var _that = this
        return d3.drag()
            .on('start', function (d) {
                d3.event.sourceEvent.stopPropagation();
                // restart()方法重新启动模拟器的内部计时器并返回模拟器。
                // 与simulation.alphaTarget或simulation.alpha一起使用时，此方法可用于在交互
                // 过程中进行“重新加热”模拟，例如在拖动节点时，在simulation.stop暂停之后恢复模拟。
                // 当前alpha值为0，需设置alphaTarget让节点动起来
                if (!d3.event.active) force.alphaTarget(0.1).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', function (d) {
                // d.fx属性- 节点的固定x位置
                // 在每次tick结束时，d.x被重置为d.fx ，并将节点 d.vx设置为零
                // 要取消节点，请将节点 .fx和节点 .fy设置为空，或删除这些属性。
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            })
            .on('end', function (d) {
                // 让alpha目标值值恢复为默认值0,停止力模型
                if (!d3.event.active) force.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            })
    }
    highlightObject = (obj) => {
        let _that = this
        const svg = this.svg
        if (obj) {
            var objIndex = obj.index;
            _that.dependsNode = _that.dependsNode.concat([objIndex]);
            _that.dependsLinkAndText = _that.dependsLinkAndText.concat([objIndex]);
            _that.data["links"].forEach(function (lkItem) {
                if (objIndex == lkItem['source']['index']) {
                    _that.dependsNode = _that.dependsNode.concat([lkItem.target.index]);
                } else if (objIndex == lkItem['target']['index']) {
                    _that.dependsNode = _that.dependsNode.concat([lkItem.source.index]);
                }
            });

            // 隐藏节点
            svg.selectAll('circle').filter(function (d) {
                return (_that.dependsNode.indexOf(d.index) == -1);
            }).transition().style('opacity', 0.1);
            // 隐藏线
            svg.selectAll('.line').filter(function (d) {
                // return true;
                return ((_that.dependsLinkAndText.indexOf(d.source.index) == -1) && (_that.dependsLinkAndText.indexOf(d.target.index) == -1))
            }).transition().style('opacity', 0.1);

        } else {
            // 取消高亮
            // 恢复隐藏的线
            svg.selectAll('circle').filter(function () {
                return true;
            }).transition().style('opacity', 1);
            // 恢复隐藏的线
            svg.selectAll('.line').filter(function (d) {
                // return true;
                return ((_that.dependsLinkAndText.indexOf(d.source.index) == -1) && (_that.dependsLinkAndText.indexOf(d.target.index) == -1))
            }).transition().style('opacity', 1);
            // _that.highlighted = null,
            _that.dependsNode = [],
                _that.dependsLinkAndText = [];
        }
    };

    _nodes = () => {
        const {r, strokeWidth,isHighLight} = conf
        const _that = this
        const svg = this.svg
        const data = this.data
        let patterns = svg.select('defs').selectAll("pattern.patternclass")
            .data(data.nodes)
            .enter()
            .append("pattern")
            .attr("class", "patternclass")
            .attr("id", function (d, index) {
                return 'avatar' + d.id;
            })
            // 两个取值userSpaceOnUse  objectBoundingBox
            .attr('patternUnits', 'objectBoundingBox')
            // <pattern>，x、y值的改变决定图案的位置，宽度、高度默认为pattern图案占填充图形的百分比。
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "1")
            .attr("height", "1");
        patterns.append("image")
            .attr("class", "circle")
            .attr("xlink:href", function (d) {
                // console.log(d)
                // d.avatar ||
                return  "https://static.linkeddb.com/m/images/none.jpg"; // 修改节点头像
            })
            .attr("src", function (d) {
                return  "https://static.linkeddb.com/m/images/none.jpg"; // 修改节点头像
            })
            .attr("height", r * 2)
            .attr("width", r * 2)
            .attr("preserveAspectRatio", "xMidYMin slice");

        // 3.4 名字
        patterns.append("rect").attr("x", "0").attr("y", 4 / 3 * r).attr("width", 2 * r).attr("height", 2 / 3 * r).attr("fill", "black").attr("opacity", "0.5");
        patterns.append("text").attr("class", "nodetext")
            .attr("x", r).attr("y", (5 / 3 * r))
            .attr('text-anchor', 'middle')
            .attr("fill", "#fff")
            .style("font-size", r / 3)
            .text(function (d) {
                return d.name;
            });
        // 加入svg
        let node = svg.selectAll("circle.node");
        node = node.data(data["nodes"], d => {(d["id"])});
        node.exit().remove();

        node = node.enter().append("circle")
            .attr("class", d => d.isNew ? 'new-node node' : "node")
            .style("cursor", "pointer")
            .attr("fill", function (d) {
                return ("url(#avatar" + d.id + ")");
            })
            .attr("stroke", "#ccf1fc")
            .attr("stroke-width", strokeWidth)
            .attr("r", r)
            .merge(node)
            .on('mouseover', function (d) {
                d3.select(this).attr('stroke-width', '8');
                d3.select(this).attr('stroke', '#a3e5f9');
                
                if (isHighLight&&_that.state.curBtn !== 'J_AddLine') {
                    _that.highlightObject(d);
                }
            })
            .on('mouseout', function (d) {
                d3.select(this).attr('stroke-width', strokeWidth);
                d3.select(this).attr('stroke', '#c5dbf0');
                if (isHighLight&&_that.state.curBtn !== 'J_AddLine') {
                    _that.highlightObject(null);
                }
            }).on('click',function(d){

                if (this.classList.contains('selected')) {
                    d3.select(this).classed('selected', false);
                } else {
                    d3.select(this).classed('selected', true);
                }
            })
        return node
    }

    getDis = (s, t) => {
        return Math.sqrt((s.x - t.x) * (s.x - t.x) + (s.y - t.y) * (s.y - t.y));
    }
    _lines = () => {
        const data = this.data
        const svg = this.svg
        //直线
        let line = svg.selectAll("g.line");

        line = line.data(data["links"], d => {
            return (`${d["source"]["id"]}_${d["target"]["id"]}`)
        });
        line.exit().remove();

        console.log("g.line", line)
        line = line.enter()
            .append("g")
            .attr("class", "line")
            .merge(line)
            .on('mouseover', function () {
                d3.select(this).selectAll('path.links').attr('stroke-width', 4);
            })
            .on('mouseout', function () {
                d3.select(this).selectAll('path.links').attr('stroke-width', 1);
            })

        line.selectAll(".links").remove();
        line.selectAll(".rect_g").remove();
        // 5.2 添加线
        line.append("path").attr("class", "links")
            .attr("d", d => {return "M" + conf.r + "," + 0 + " L" + this.getDis(d.source, d.target) + ",0";})
            .style("marker-end", "url(#end-arrow)")
            .attr("refX", conf.r)
            .attr('stroke', conf.linkColor);
        // 线上的描述语
        let group = line.append("g").attr("class", "rect_g")
        group.append("rect")
            .attr("x", 40)
            .attr("y", -10)
            .attr("width", 40)
            .attr("height", 20)
            .attr("fill", "white")
            .attr('stroke', conf.linkColor)
        group.append("text")
            .attr("x", 40)
            .attr("y", 5)
            .attr("text-anchor", "middle")  // <text>文本中轴对齐方式居中  start | middle | end
            .style("font-size", 12).text(d => {
                return d.relation
            });
        // line.attr('class','testttt')
        return line;
    }
    getTransform(source, target, _dis) {
        var r;
        if (target.x > source.x) {
            if (target.y > source.y) {
                r = Math.asin((target.y - source.y) / _dis)
            } else {
                r = Math.asin((source.y - target.y) / _dis);
                r = -r;
            }
        } else {
            if (target.y > source.y) {
                r = Math.asin((target.y - source.y) / _dis);
                r = Math.PI - r;
            } else {
                r = Math.asin((source.y - target.y) / _dis);
                r -= Math.PI;
            }
        }
        r = r * (180 / Math.PI);
        return "translate(" + source.x + "," + source.y + ")rotate(" + r + ")";
    }
    // tick心跳函数
    _tick = (line, node) => {
        var _app = this
        // console.log("tick tok",line)
        // 7.1 修改每条容器edge的位置
        line.attr("transform", (d) => {
            return this.getTransform(d.source, d.target, this.getDis(d.source, d.target))
        });
        console.log()
        // 7.2 修改每条线link位置
        line.selectAll('.links').attr("d", d => {
            // console.log(d.source)
            return "M" + conf.r + "," + 0 + " L" + this.getDis(d.source, d.target) + ",0";
        })

        // 7.3 修改线中关系文字text的位置 及 文字的反正
        line.select('.rect_g').select('text')
            .attr("x", (d) => {
                // 7.3.1 根据字的长度来更新兄弟元素 rect 的宽度
                // var bbox = d3.select(this).node().getBBox();
                // var width = bbox.width;
                // $(this).prev('rect').attr('width', width + 10);
                // // 7.3.2 更新 text 的位置
                // console.log(this.getDis(d.source, d.target) / 2)
                return this.getDis(d.source, d.target) / 2
            })
            .attr("transform", (d) => {
                // 7.3.3 更新文本反正
                if (d.target.x < d.source.x) {
                    var x = this.getDis(d.source, d.target) / 2;
                    return 'rotate(180 ' + x + ' ' + 0 + ')';
                } else {
                    return 'rotate(0)';
                }
            });

        // 7.4 修改线中装文本矩形rect的位置
        line.select('.rect_g').select('rect')
            .attr("x", function (d) {
                return _app.getDis(d.source, d.target) / 2 - 20
            })    // x 坐标为两点中心距离减去自身长度一半
        // 5.修改节点的位置
        node.attr("cx", function (d) {
            return d.x;
        }).attr("cy", function (d) {
            return d.y;
        })
    };
    _bindEvent = (node, line, update) => {
        var svg = this.svg
        var _that = this
        d3.select('#J_AddLine').on('click', function () {
            let mousedownNode = null,
                mouseupNode = null;
            let dragLine = svg.append("line").attr("class", "drag-line");
            node.on('mousedown.node', function (d) {
                mousedownNode = d
                dragLine.attr("class", "drag-line")
                    .lower()
                    .attr("x1", d["x"])
                    .attr("y1", d["y"])
                    .attr("x2", d["x"])
                    .attr("y2", d["y"]);
                d3.event.stopPropagation();
            }).on('mouseup.node',function(d){

            })
        })

        d3.select('#J_AddNode').on('click', function () {
            _that.addNode()
        })
        d3.select('#J_DelNode').on('click', function () {
            _that.delNode()
        })
    }
    _bindLinkAndNodeEvent = (node, line, update) => {
        node
    }
    checkIsolateNode = ()=>{

    }
    delNode = ()=>{
        let selectedNodes = d3.selectAll('.node.selected').data()
        let selectedNodes_ids = selectedNodes.map(v=>v.id)
        let data_nodes = this.data["nodes"].filter((d,i)=>{
            return selectedNodes_ids.indexOf(d.id)==-1
        })
        console.log(selectedNodes_ids)
        let data_links = this.data["links"].filter((d,i)=>{
        //    console.log(d.source.id,selectedNodes_ids)
        //    console.log(d.target.id,selectedNodes_ids)
            console.log(d.source.id,d.target.id)
            // console.log(selectedNodes_ids.indexOf(d.target.id))
            console.log(selectedNodes_ids.indexOf(d.source.id)==-1,selectedNodes_ids.indexOf(d.target.id)==-1)
           return selectedNodes_ids.indexOf(d.source.id)==-1&&selectedNodes_ids.indexOf(d.target.id)==-1
            // d.source.id
        })
        // console.log(this.data["links"])
        // console.log(data_links)

        this.data["nodes"] = data_nodes
        this.data["links"] = data_links
        console.log(this.data["links"])

        this.updateData(this.data)
    }
    addNode = () => {
        var new_node = {
            "name": "未命名",
            "id": 101,
            "avatar": "https://static.linkeddb.com/m/images/none.jpg",
            "isNew": true
        }
        this.data["nodes"].push(new_node)
        this.updateData(this.data)
    }

    componentDidMount() {
        getRelation(1).then(res => {
            let data = res.data
            this.svg = this._svg('graph-area')
            this.force = this._force()
            this.data = data
            this.force.alphaTarget(.1).restart();
            // this.force.restart();
            this.updateData(data)

        })
    }
    updateData = (data) => {
        const {linkDistance} = conf
        let force = this.force

        // this.force.alphaTarget()
        //转换数据
        force.nodes(data["nodes"]);
        // force.links(data["links"])
        force.force("link", d3.forceLink(data["links"]).id(d => d.id).distance(linkDistance));
        //生成节点连接线
        let line = this._lines();
        let node = this._nodes();
        // let linetext = _linetext(data, svg);
        let bindEvent = this._bindEvent(node, line);
        // let bindLinkAndNodeEvent = _bindLinkAndNodeEvent(node, line,update);
        // node.call(this._drag(force));//绑定拖拽
        force.on('tick', () => (this._tick(line, node)))
    }
    selectBtn = (e) => {
        this.setState({
            curBtn: e.target.id
        })
    }
    render() {
        return <>
            <ul styleName="operation-btns">
                <li className={`button ${this.state.curBtn == "J_AddNode" ? 'selected' : ''}`} id="J_AddNode" onClick={(e) => this.selectBtn(e)}>添加节点</li>
                <li className={`button ${this.state.curBtn == "J_AddLine" ? 'selected' : ''}`} id="J_AddLine" onClick={(e) => this.selectBtn(e)}>添加线</li>
                <li className={`button ${this.state.curBtn == "J_DelNode" ? 'selected' : ''}`} id="J_DelNode" onClick={(e) => this.selectBtn(e)}>删除节点</li>
                {/* <li className={`button ${this.state.curBtn == "J_DelLine" ? 'selected' : ''}`} id="J_DelLine" onClick={(e) => this.selectBtn(e)}>删除线</li> */}
            </ul>

            <div id="graph-area"></div>
        </>
    }
}

export default CssModules(RelationWorkspace, realationStyle)