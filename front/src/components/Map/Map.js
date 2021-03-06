import  'leaflet/dist/leaflet.css'
import  L from 'leaflet'
import spotRegButton from './MapButtons/SpotRegButton.vue'
import nowLocButton from './MapButtons/NowLocButton.vue'
import {getSpot} from '../../routes/spotRequest'
import spotDetail from '../SpotDetail/SpotDetail.vue'
import searchDialog from './MapButtons/SearchDialog.vue'
import '../../plugins/Leaflet.Icon.Glyph.js'
import '../../plugins/L.Icon.Pulse.js'
import { getSpotTypeDict } from '../share/SpotTypeFunction'
import mapLoading from './MapLoading.vue'

//アイコンをロード
delete  L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions(
    {   iconUrl         : require( 'leaflet/dist/images/marker-icon.png' )
    ,   iconRetinaUrl   : require( 'leaflet/dist/images/marker-icon-2x.png' )
    ,   shadowUrl       : require( 'leaflet/dist/images/marker-shadow.png' )
    }
)

export default {
    name: "Map",
    components:{
        spotRegButton,
        nowLocButton,
        spotDetail,
        searchDialog,
        mapLoading
    },
    data: function(){
        return {
            lat:0,//緯度
            lon:0,//経度
            map: L.map,//Mapオブジェクト
            zoom:10,//zoomのサイズ まだうまく制御できてない(SATD)
            spot:null,//spot用のオブジェクト
            spotNameList:[],//スポット名のリスト，v-autocompleteで利用するため
            review:null,//review用のオブジェクト
            myplace:null,//現在地オブジェクト
            regFlag:false,//スポット登録モードのフラグ
            flag :false,//実装上の都合で導入したフラグ
            locMarker:null,//現在地のマーカーオブジェクト 
            nowType:'reset',//スポット検索の種別 "reset" "restaurant" "travel" "shopping"
            time:0,//タイマー用変数
            showDialog:false, //ダイアログを表示するか
            selectedSpotID: "", //クリックして選択しているspotのid
            selectedSpotUserId: "",
            markers:null,//マーカーリストのレイヤー群
            univFlag:false,//大学別検索の有効化・無効化
            user:{
                username:null, 
                email: null,
                password: null,
                univ:"",
            },
            tags: [],
            isLoadingSpot: false
        };
    },
    methods: {
        //Map上に検索条件にあったスポットを表示する関数
        showSpot: async function (type, univ, keyword) {
            if (type == "reset") type = "";
            this.isLoadingSpot = true
            var data = await getSpot("", "", type, "", univ);
            this.isLoadingSpot = false
            if (data.success){
                var spots = data.spots;
                //キーワードを含まないスポットを除外
                spots = spots.filter(function(spot){
                    return spot.spot_name.indexOf(keyword) != -1;
                });
                var markerSet = []//マーカーのリスト

                const icon_dict = getSpotTypeDict('icon')
                const color_dict = getSpotTypeDict('color')
                //TODO : filter by rating
                spots.forEach(spot => {
                    
                    var marker = L.marker([spot.y, spot.x],
                        { icon: L.icon.glyph({ prefix: 'mdi', glyph: icon_dict[spot.spot_type.split(",")[0]], color: color_dict[spot.spot_type.split(",")[0]] }) })
                        .on('click', this.markerClickEvent);
                    marker.spot_id = spot.spot_id;
                    marker.user_id = spot.user_id;
                    markerSet.push(marker)
                });
                this.markers = L.layerGroup(markerSet).addTo(this.map)
            } else {
                alert('Spot does not exist.')
            }
        },

        //TODO
        //画面の枠組みの経緯度を取得する関数
        // getWindow: function(){
        //     var mapframe = this.map.getBounds()
        //     var west = mapframe.getWest()
        //     var east = mapframe.getEast()
        //     var north = mapframe.getNorth()
        //     var south = mapframe.getSouth()
        // },
        //Map上のどこかををクリックした時に起動する関数
        mapClickEvent(event){
            if(this.$store.state.userData!=null){
                if(this.flag){
                this.flag=false
                this.getPoint(event);
                this.regSpot(event);
            }else{this.flag=true;}
        }
        },

        //Map上のクリックされた箇所の経緯度を取得する関数
        getPoint: function(event){
            this.lat = event.latlng.lat;
            this.lon = event.latlng.lng;
        },

        //Markerがクリックされた時に起動する関数
        markerClickEvent(event){
            this.showDialog = true;
            this.selectedSpotID = event.target.spot_id;
            this.selectedSpotUserId = event.target.user_id;
        },

        //現在地アイコンを更新する関数(予定)
        locationMarker(location){
            if(this.locMarker != null) {
                this.map.removeLayer(this.locMarker);
            }
            var pulsingIcon = L.icon.pulse({
                iconSize:[25,25]
                ,color:'#1bb1ce'
                ,fillColor:'#1bb1ce'
                ,heartbeat: 1
            });
            this.locMarker = L.marker(location.latlng, {icon:pulsingIcon}).addTo(this.map);
        },

        //スポット登録関数
        regSpot: function(){
            this.$router.push({ name: 'register', query: { "lat": this.lat,"lon":this.lon}});
        },

        //通常モードと登録モードの切り替え関数
        changeMode: function(){
            this.regFlag = !this.regFlag;
            if(this.regFlag){
                this.flag=false
                this.map.on('click', this.mapClickEvent);
            }
            else{
                this.map.off('click')
            }
        },

        //マップの中心を現在地に更新する関数
        setNowLocation: function(){
            this.map.locate({ setView: true, zoom: this.zoom});
            //現在地マーカーを設置
        },

        // tagのリストを文字列に変換
        typesToStrs: function(types) {
            var strs = ""
            for (var i = 0; i < types.length; i++) {
                if (i != types.length - 1) {
                    strs = strs + types[i] + ",";
                } else {
                    strs = strs + types[i];
                }
            }
            return strs;
        },

        //検索ジャンルを更新するメソッド
        search: async function(...args){
            const [type,univ,keyword,rating,tags] = args
            this.markers.clearLayers();
            this.marker = [];
            this.nowType = type;
            this.tags = tags;
            let typeAndTags = type + ((tags.length > 0)? ("," + this.typesToStrs(tags)) : "");

            if(univ){
                await this.showSpot(typeAndTags,this.user.univ,keyword,rating);
            } else{
                await this.showSpot(typeAndTags,"",keyword,rating);
            }
        },
        //TODO : filter by rating
        //スポットごとのレビュー評価平均を計算する関数
        // culSpotRating: function(spot_id,reviews){
        //     reviews = reviews.filter(function(review){
        //         return review.spot_id == spot_id
        //       });
        //     var sumRate=0;
        //     var dataNum=0;
        //     reviews.forEach(review => {
        //         sumRate = sumRate+review.score;
        //         dataNum += 1;
        //     });
        //     return sumRate/dataNum;
        // },
        closeDialog() {
            this.showDialog = false;
        }
},

    //画面読み込み時の関数
    mounted:async function() {
        if(this.$store.state.userData!=null){
            this.user.username = this.$store.state.userData.username;
            this.user.email = this.$store.state.userData.email;
            this.user.password = this.$store.state.userData.password;
            this.user.univ = this.$store.state.userData.university;
        }
        //Mapオブジェクトの生成
        this.map = L.map('map',{zoom: 10,maxZoom: 18,minZoom:4})
        .addLayer(
            L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
                attribution:
                'Map data &copy <a href="https://openstreetmap.org">OpenStreetMap</a>'
            })
        );

        //初期位置を現在地に
        this.map.locate({ setView: true, zoom:this.zoom});

        //現在地マーカーを設置(予定)
        this.map.on("locationfound",this.locationMarker);

        //setInterval(this.setNowLocation, 1000 * 20);

        //spot表示
        this.showSpot(this.nowType,"","",0);
        var data = await getSpot("","","","","");
        this.spotNameList = data.spots;
    }, 
    //現在地追跡のために利用(予定)
    watch: {
    }
}